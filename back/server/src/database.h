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
    bool roomExists(pqxx::work &tx, std::string roomName);
    bool loginUser(pqxx::work &tx, std::string username, std::string password);
    bool createUser(pqxx::work &tx, std::string username, std::string password);
    bool userInRoom(pqxx::work& tx, std::string room, std::string user);
    bool removeUserFromRoom(pqxx::work& tx, std::string room, std::string user);
    bool createDM(pqxx::work& tx, std::string userA, std::string userB);


    std::string addChatToRoom(pqxx::work &tx, std::string room, std::string username, std::string msg);
    std::string createRoom(pqxx::work &tx, std::vector<std::string> usersToAdd, std::string name);
    std::string addUserToRoom(pqxx::work& tx, std::string roomName, std::string userToAdd);
    std::vector<nlohmann::json> loadRoom(pqxx::work& tx, const std::string& roomName);
    std::map<std::string, std::string> getRooms(pqxx::work& tx, const std::string& user);

    // Generates a random code so each room is unique even if they have the same name (if/when we add room names)
    std::string generateRandomRoomId();

    // Just to view a table
    void dumpTable(pqxx::work& tx, const std::string& table);

    pqxx::connection con;
};

#endif
