#ifndef SERVER_H
#define SERVER_H

#include <boost/asio.hpp>
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include <openssl/sha.h>
#include <iostream>
#include <string>
#include "database.h"
#include <unordered_map>
#include <unordered_set>

typedef websocketpp::server<websocketpp::config::asio> server;

struct hdl_hash {
    std::size_t operator()(const websocketpp::connection_hdl& hdl) const {
        return std::hash<void*>()(hdl.lock().get());
    }
};
struct hdl_equal {
    bool operator()(const websocketpp::connection_hdl& a, const websocketpp::connection_hdl& b) const {
        return a.lock().get() == b.lock().get();
    }
};

class MyServer {
public:
    MyServer();
    void run(uint16_t port);

private:

    // Connection functions, will run when a connection is made, closed, and when a connection send a message
    void on_open(websocketpp::connection_hdl hdl);
    void on_close(websocketpp::connection_hdl hdl);
    void on_message(websocketpp::connection_hdl hdl, server::message_ptr msg);

    std::string create_user(std::string userPass);
    std::string login_user(std::string userPass);
    std::string build_room(std::string nameAndusers);
    void add_to_room(std::string user);
    std::string get_room_list(std::string user);

    std::string load_room_chats(std::string room);

    void enter_room(std::string room, websocketpp::connection_hdl hdl);
    void add_chat(std::string userMsgRoom);

    // Gotta be good boys and not store passwords in plaintext
    std::string hash(std::string word);

    server m_server;
    Database* db;

    // This map holds a room, and all the connections that are currently on it, used for instant updates in chats
    std::unordered_map<
        std::string,    // room
        std::unordered_set<websocketpp::connection_hdl, hdl_hash, hdl_equal> // connections
    > room_users;
    
    };

#endif
