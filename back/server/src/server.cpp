#include "server.h"
#include <iomanip>
#include <sstream>
#include <ctime>
#include <chrono>

// Setup server overhead and db
MyServer::MyServer() : m_server(){
    m_server.init_asio();
    m_server.clear_access_channels(websocketpp::log::alevel::all);
    m_server.clear_error_channels(websocketpp::log::elevel::all);
    m_server.set_open_handler(std::bind(&MyServer::on_open, this, std::placeholders::_1));
    m_server.set_close_handler(std::bind(&MyServer::on_close, this, std::placeholders::_1));
    m_server.set_message_handler(std::bind(&MyServer::on_message, this, std::placeholders::_1, std::placeholders::_2));
    db = new Database();
}

void MyServer::run(uint16_t port){
    m_server.set_reuse_addr(true);  // Saves some developing errors claiming the port is still being used
    m_server.listen(port);
    m_server.start_accept();
    m_server.run();
}

void MyServer::on_open(websocketpp::connection_hdl hdl){
    std::cout << "New connection!!!!" << std::endl;
}

void MyServer::on_close(websocketpp::connection_hdl hdl){
    // They won't care about seeing it instantly since they logged off!
    for (auto& [room, users] : room_users){
        users.erase(hdl);
    }
    std::cout << "Connection closed!!!!" << std::endl;
}

void MyServer::on_message(websocketpp::connection_hdl hdl, server::message_ptr msg){
    std::string payload = msg->get_payload();

    std::cout << "payload\n" << payload << "\n";
    std::istringstream stream(payload);
    std::string line, input;
    char code;


    //TODO
    /* A little silly but this was the first thing I thought of, lets say the frontend wants something
       for example to login a user, I set up a list of codes that you can see below where the frontend will send
       a message like this:
       0
       username
       password
       and we'll take that first code and send the info to th eright function, super scuffed and we can fix it if desired
    */
    std::getline(stream, line);
    code = line[0];

    size_t pos = payload.find('\n');
    if (pos != std::string::npos){
        input = payload.substr(pos + 1);
    }

    switch(code){
    case '0':
        m_server.send(hdl, create_user(input), websocketpp::frame::opcode::text);
        break;
    case '1':
        m_server.send(hdl, login_user(input), websocketpp::frame::opcode::text);
        break;
    case '2':
        m_server.send(hdl, build_room(input), websocketpp::frame::opcode::text);
        break;
    case '3':
        add_to_room(input);
        break;
    case '4':
        m_server.send(hdl, load_room_chats(input), websocketpp::frame::opcode::text);
        break;
    case '5':
        enter_room(input, hdl);
        break;
    case '6':
        add_chat(input);
        break;
    case '7':
        m_server.send(hdl, get_room_list(input), websocketpp::frame::opcode::text);
        break;
    } 
}

// Some functions like the below 2 will send back a 0 or 1 since we just want boolean answers

// Return 0 if that username doesnt already exists, 1 if otherwise
std::string MyServer::create_user(std::string userPass){
    std::string username, password, hashedPass, result;
    std::istringstream stream(userPass);

    std::getline(stream, username);
    std::getline(stream, password);

    hashedPass = hash(password);

    pqxx::work tx(db->con);

    result = db->createUser(tx, username, hashedPass) ? "0" : "1";
    db->dumpTable(tx, "users");
    tx.commit();

    return result;
}

// Return 0 if username and password matches, else 1
std::string MyServer::login_user(std::string userPass){
    std::string username, password, hashedPass, result;
    std::istringstream stream(userPass);

    std::getline(stream, username);
    std::getline(stream, password);

    hashedPass = hash(password);

    pqxx::work tx(db->con);

    if (db->loginUser(tx, username, hashedPass)){
        result = "0";
    } else {
        result = "1";
    }

    tx.commit();
    return result;
}

// Takes a list of usernames and builds a brand new room, it will return the room id (for now called room name)
std::string MyServer::build_room(std::string usersIn){
    std::vector<std::string> users;

    std::string line;
    std::istringstream stream(usersIn);

    while (std::getline(stream, line)){
        users.push_back(line);
    }

    pqxx::work tx(db->con);
    std::string name = db->createRoom(tx, users);
    db->dumpTable(tx, "usersinrooms");

    tx.commit();
    std::cout << "new room called " << name << "\n";
    return name;
}

// Gets the ids of all the rooms a user is part of
std::string MyServer::get_room_list(std::string user){
    pqxx::work tx(db->con);
    std::vector<std::string> rooms = db->getRoomNames(tx, user);
    tx.commit();

    nlohmann::json json;
    json["rooms"] = rooms;

    std::string payload = json.dump();
    return payload;
}


void MyServer::add_to_room(std::string nameAndUser){
    std::string name, user;
    std::istringstream stream(nameAndUser);

    std::getline(stream, name);
    std::getline(stream, user);

    pqxx::work tx(db->con);
    db->addUserToRoom(tx, name, user);

    db->dumpTable(tx, "usersinrooms");
    tx.commit();
}

// Returns all the messages in a room, check db function for json structure
std::string MyServer::load_room_chats(std::string room){
    pqxx::work tx(db->con);
    std::vector<nlohmann::json> chats = db->loadRoom(tx, room);
    tx.commit();

    nlohmann::json j;
    j["chats"] = chats;

    std::string payload = j.dump();
    return payload;
}

// Add connection to the map
void MyServer::enter_room(std::string room, websocketpp::connection_hdl hdl){
    room_users[room].insert(hdl);
}

//TODO: An exit_room function that removes the user from the map instead of only when they close, which is dumb

void MyServer::add_chat(std::string userMsgRoom){
    std::string user, msg, room;
    std::istringstream stream(userMsgRoom);

    std::getline(stream, user);
    std::getline(stream, msg);
    std::getline(stream, room);

    pqxx::work tx(db->con);
    std::string time = db->addChatToRoom(tx, room, user, msg);

    nlohmann::json j;
    j["type"] = "new_message";
    j["user"] = user;
    j["message"] = msg;
    j["timestamp"] = time;

    std::string payload = j.dump();

    for (const auto& hdl : room_users[room]){
        std::cout << "sent " << payload << "\n";
        m_server.send(hdl, payload, websocketpp::frame::opcode::text);
    }

    db->dumpTable(tx, "rooms");
    tx.commit();
}

std::string MyServer::hash(std::string word){
    unsigned char hash[SHA256_DIGEST_LENGTH];

    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, word.c_str(), word.size());
    SHA256_Final(hash, &sha256);
  
    std::stringstream ss;
  
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++){
      ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>( hash[i] );
    }
    return ss.str();
}