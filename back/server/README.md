Alright heres the sources for the server and databse operation and functions
along with a simple html page to test functionality.
Packages needed to install are:

libboost-all-dev
libboost-version-dev
libssl-dev
libpqxx-dev

TODO:
Add RSA for encrypting messages if we're cool
Try to protect against SQL injection
Add exit_room and leave_room funciton
(first when just getting out of a rooms chat screen, the other to remove the user from the group completely)
Fix function selecting in server.cpp