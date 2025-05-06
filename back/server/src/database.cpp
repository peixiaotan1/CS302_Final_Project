#include "database.h"
#include <random>
#include <string>

std::string serialize(std::string x){
    std::string y = x;//remove & and '
    if(y.find("&") != std::string::npos) y.replace(y.find("&"), 1,"");
    if(y.find("'") != std::string::npos) y.replace(y.find("'"), 1,"");

    return y;
}

Database::Database() : con("dbname=postgres user=postgres password=admin host=localhost port=5432")
{
    try {
        if (con.is_open()){
            std::cout << "Connected to " << con.dbname() << "\n";
            pqxx::work tx(con);
            
            // Create users table
            tx.exec(R"(
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    password TEXT NOT NULL,
                    rooms TEXT[]
                )
            )");
            
            // Create rooms table
            tx.exec(R"(
                CREATE TABLE IF NOT EXISTS rooms (
                    roomid TEXT,
                    username TEXT,
                    message TEXT,
                    datetime TIMESTAMPTZ DEFAULT NOW()
                )
            )");

            // Rooms Ids and their names
            tx.exec(R"(
                CREATE TABLE IF NOT EXISTS roomnames (
                    roomid TEXT PRIMARY KEY,
                    roomname TEXT NOT NULL
                )
            )");
            
            // Create usersinrooms table
            tx.exec(R"(
                CREATE TABLE IF NOT EXISTS usersinrooms (
                    username TEXT NOT NULL,
                    roomid TEXT NOT NULL,
                    PRIMARY KEY (username, roomid)
                )
            )");
            
            tx.commit();
        } else {
            std::cerr << "Can't open database\n";
        }
    } catch (const std::exception& e){
        std::cerr << "Error: " << e.what() << "\n";
        exit(1);
    }
}

bool Database::userExists(pqxx::work& tx, std::string username){
    auto result = tx.exec("SELECT 1 FROM users WHERE username = '" + tx.esc(serialize(username)) + "' LIMIT 1");
    return !result.empty();
}

bool Database::roomExists(pqxx::work& tx, const std::string roomId) {
    auto result = tx.exec("SELECT 1 FROM rooms WHERE roomid = " + tx.quote(serialize(roomId)) + " LIMIT 1");
    return !result.empty();
}

bool Database::loginUser(pqxx::work& tx, std::string username, std::string password){
    pqxx::result r = tx.exec(
        "SELECT 1 FROM users WHERE username = '" + tx.esc(serialize(username)) + "' AND password = '" + tx.esc(serialize(password)) + "' LIMIT 1"
    );
    return !r.empty();
}

bool Database::createUser(pqxx::work& tx, std::string username, std::string password){
    if (!userExists(tx, username)){
        tx.exec("INSERT INTO users (username, password, rooms) VALUES ('" + tx.esc(serialize(username)) + "', '" + tx.esc(serialize(password)) + "', '{}')");
        return true;
    }
    return false;
}

bool Database::userInRoom(pqxx::work& tx, std::string room, std::string user){
    auto result = tx.exec("SELECT 1 FROM usersinrooms WHERE username = '" + tx.esc(serialize(user)) + "' AND roomid = '" + serialize(room) + "' LIMIT 1");
    return result.empty();
}

bool Database::removeUserFromRoom(pqxx::work& tx, std::string room, std::string user){

    if(!Database::userInRoom(tx, room, user)){
        tx.exec("DELETE FROM usersinrooms WHERE username = '" + serialize(user) + "' AND roomid = '" + serialize(room) + "'");
        return true;
    }
    return false;
}

std::string Database::addChatToRoom(pqxx::work& tx, std::string room, std::string username, std::string message){
    pqxx::result r = tx.exec(
        "INSERT INTO rooms (roomid, username, message, datetime) VALUES (" +
        tx.quote(serialize(room)) + ", " +
        tx.quote(serialize(username)) + ", " +
        tx.quote(serialize(message)) + ", " +
        "NOW()" +
        ") RETURNING datetime"
    );

    return r[0][0].c_str();
}

std::string Database::generateRandomRoomId(){
    const std::string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(0, chars.size() - 1);

    std::string roomId;
    for (int i = 0; i < 10; ++i){
        roomId += chars[dist(gen)];
    }
    return roomId;
}


std::string Database::createRoom(pqxx::work& tx, std::vector<std::string> usersToAdd, std::string name) {
    std::string roomId;
    do {
        roomId = generateRandomRoomId();
    } while (!tx.exec("SELECT 1 FROM rooms WHERE roomid = '" + tx.esc(roomId) + "' LIMIT 1").empty());

    if (name.empty()) {
        name = roomId;
    }

    tx.exec("INSERT INTO roomnames (roomid, roomname) VALUES (" + 
        tx.quote(serialize(roomId)) + ", " + tx.quote(serialize(name)) + ")");

    for (const auto& user : usersToAdd) {
        addUserToRoom(tx, roomId, user);
    }

    return roomId;
}


std::string Database::addUserToRoom(pqxx::work& tx, std::string roomId, std::string userToAdd){
    
    pqxx::result roomResult = tx.exec(
        "SELECT roomname FROM roomnames WHERE roomid = " + tx.quote(serialize(roomId)) + " LIMIT 1"
    );

    if (roomResult.empty()) {
        return "";
    }

    std::string roomName = roomResult[0]["roomname"].c_str();

    tx.exec(
        "UPDATE users SET rooms = array_append(rooms, '" + tx.esc(serialize(roomId)) + "') "
        "WHERE username = '" + tx.esc(serialize(userToAdd)) + "'"
    );

    tx.exec(
        "INSERT INTO usersinrooms (username, roomid) VALUES (" +
        tx.quote(serialize(userToAdd)) + ", " + tx.quote(serialize(roomId)) +
        ") ON CONFLICT DO NOTHING"
    );

    return roomName;
}

bool Database::createDM(pqxx::work& tx, std::string userA, std::string userB){
    std::string name = userA+userB;

    if(!tx.exec("SELECT 1 FROM rooms WHERE roomid = '" + tx.esc(name) + "' LIMIT 1").empty()) return false;
    if(!Database::userExists(tx, userA) or !Database::userExists(tx, userB)) return false;

    Database::createRoom(tx, {userA, userB},name);

    return true;
}

void Database::dumpTable(pqxx::work& tx, const std::string& table){
    pqxx::result r = tx.exec("SELECT * FROM " + tx.quote_name(serialize(table)));

    std::cout << "Dumping table: " << table << "\n";
    for (const auto& row : r){
        for (const auto& field : row){
            std::cout << field.c_str() << " ";
        }
        std::cout << "\n";
    }
    std::cout << "--------------------------\n";
}

std::vector<nlohmann::json> Database::loadRoom(pqxx::work& tx, const std::string& roomId){
    std::vector<nlohmann::json> messages;

    pqxx::result r = tx.exec(
        "SELECT username, message, datetime FROM rooms WHERE roomid = " + tx.quote(serialize(roomId)) + " ORDER BY datetime ASC"
    );

    for (const auto& row : r){
        nlohmann::json msg;
        msg["user"] = row["username"].c_str();
        msg["message"] = row["message"].c_str();
        msg["timestamp"] = row["datetime"].c_str();
        messages.push_back(msg);
    }

    return messages;
}

std::map<std::string, std::string>  Database::getRooms(pqxx::work& tx, const std::string& username){
    std::map<std::string, std::string> roomMap;

    pqxx::result r = tx.exec(
        "SELECT r.roomid, rn.roomname FROM usersinrooms r "
        "JOIN roomnames rn ON r.roomid = rn.roomid "
        "WHERE r.username = " + tx.quote(serialize(username))
    );

    for (const auto& row : r) {
        roomMap[row["roomid"].c_str()] = row["roomname"].c_str();
    }

    return roomMap;
}

