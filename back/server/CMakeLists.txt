cmake_minimum_required(VERSION 3.10)
project(MessagingApp)
find_package(Boost REQUIRED)
find_package(PkgConfig REQUIRED)
pkg_search_module(PQXX REQUIRED libpqxx)

include_directories(${Boost_INCLUDE_DIRS})

add_executable(messaging-app-server src/server.cpp src/database.cpp src/main.cpp)

target_link_libraries(messaging-app-server ${Boost_LIBRARIES}  -lpqxx -lpq pthread)
