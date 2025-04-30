#include "server.h"
#include <iomanip>
#include <sstream>
#include <ctime>
#include <chrono>

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
    m_server.set_reuse_addr(true);
    m_server.listen(port);
    m_server.start_accept();
    m_server.run();
}

void MyServer::on_open(websocketpp::connection_hdl hdl){
    std::cout << "New connection!!!!" << std::endl;
}

void MyServer::on_close(websocketpp::connection_hdl hdl){
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

std::string MyServer::create_user(std::string userPass){
    std::string username, password, result;
    std::istringstream stream(userPass);

    std::getline(stream, username);
    std::getline(stream, password);

    pqxx::work tx(db->con);

    result = db->createUser(tx, username, password) ? "0" : "1";
    db->dumpTable(tx, "users");
    tx.commit();

    return result;

}

std::string MyServer::login_user(std::string userPass){
    std::string username, password, result;
    std::istringstream stream(userPass);

    std::getline(stream, username);
    std::getline(stream, password);

    pqxx::work tx(db->con);

    if (db->loginUser(tx, username, password)){
        result = "0";
    } else {
        result = "1";
    }

    tx.commit();
    return result;
}

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


std::string MyServer::load_room_chats(std::string room){
    pqxx::work tx(db->con);
    std::vector<nlohmann::json> chats = db->loadRoom(tx, room);
    tx.commit();

    nlohmann::json j;
    j["chats"] = chats;

    std::string payload = j.dump();
    return payload;
}

void MyServer::enter_room(std::string room, websocketpp::connection_hdl hdl){
    room_users[room].insert(hdl);
}

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
    j["timestamp"] = time;  // get current time as string

    std::string payload = j.dump();

    for (const auto& hdl : room_users[room]){
        std::cout << "sent " << payload << "\n";
        m_server.send(hdl, payload, websocketpp::frame::opcode::text);
    }

    db->dumpTable(tx, "rooms");
    tx.commit();
}