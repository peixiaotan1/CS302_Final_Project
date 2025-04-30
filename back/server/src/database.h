#ifndef DATABASE_H
#define DATABASE_H

#include <pqxx/pqxx>
#include "json.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <ctime>

class Database {
public:
    Database();
    bool userExists(pqxx::work &tx, std::string username);
    bool loginUser(pqxx::work &tx, std::string username, std::string password);
    bool createUser(pqxx::work &tx, std::string username, std::string password);

    std::string addChatToRoom(pqxx::work &tx, std::string room, std::string username, std::string msg);
    std::string createRoom(pqxx::work &tx, std::vector<std::string> usersToAdd);
    void addUserToRoom(pqxx::work& tx, std::string roomName, std::string userToAdd);
    std::vector<nlohmann::json> loadRoom(pqxx::work& tx, const std::string& roomName);
    std::vector<std::string> getRoomNames(pqxx::work& tx, const std::string& user);

    std::string generateRandomRoomName();
    void dumpTable(pqxx::work& tx, const std::string& table);

    pqxx::connection con;
};

#endif