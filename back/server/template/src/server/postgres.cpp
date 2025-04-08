//sudo apt install libpqxx-dev

#include <iostream>
#include <string>
#include <vector>

#include <pqxx/pqxx>
#include <chrono>

using namespace std;
/*
check if username exists*
if it does check if password matches
if not create new user entry*

add chat to room's table*

create table for room*
add list of users to usersinroom*

query not stored msgs
*/
pqxx::result addUsertoRoom(pqxx::work tx, string username, string password){//create user
	return tx.exec("INSERT INTO users VALUES (" + username + "," + password + ");");
}

bool userExists(pqxx::work tx, string username){//check if user exists
	return tx.exec("FROM users; WHERE [username] LIKE '" + username + "'").size();
}

pqxx::result createUser(pqxx::work tx, string username, string password){//if username not used create it with given password
	if(!userExists(tx, username)) return addUsertoRoom(tx, username, password);
}

pqxx::result addChattoRoom(pqxx::work tx, string room, string username, string msgId, string msg){
	return tx.exec("INSERT INTO room_" + room + " VALUES (" + msgId + "," + username + "," + msg + "," + ctime(chrono::system_clock::to_time_t(chrono::system_clock::now())) + ");");
}

bool createRoom(pqxx::work tx, string name, vector<string> usersToAdd){//create new table for chats and add users to room table
	//make sure these both run, if fail return false
	tx.exec("CREATE TABLE room_<" + name + "> (chatId INT, username varchar(255), message varchar(4096), datetime timestamp[(p)][with time zone]);");
	for(int i = 0; i < (int)usersToAdd.size(); i++){
		tx.exec("INSERT INTO usersinrooms VALUES (" + name + "," + usersToAdd[i] + ");");
	}

	return true;
}
