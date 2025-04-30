#include "server.h"
#include "database.h"

int main() {
    MyServer server;
    server.run(8080);
    return 0;
}