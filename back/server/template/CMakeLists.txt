cmake_minimum_required(VERSION 3.10)
project(MessagingApp)

find_package(Boost REQUIRED)
include_directories(${Boost_INCLUDE_DIRS})
add_executable(messaging-app-server src/server/main.cpp)
target_link_libraries(messaging-app-server ${Boost_LIBRARIES} pthread)
