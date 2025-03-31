#include <boost/asio.hpp>
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include <iostream>
#include <string>

typedef websocketpp::server<websocketpp::config::asio> server;

class SwagServer {
public:
    SwagServer() : m_server() {
        m_server.init_asio();
        m_server.set_open_handler(std::bind(&SwagServer::on_open, this, std::placeholders::_1));
        m_server.set_close_handler(std::bind(&SwagServer::on_close, this, std::placeholders::_1));
        m_server.set_message_handler(std::bind(&SwagServer::on_message, this, std::placeholders::_1, std::placeholders::_2));
    }

    void run(uint16_t port) {
        m_server.listen(port);
        m_server.start_accept();
        m_server.run();
    }

private:
    void on_open(websocketpp::connection_hdl hdl) {
        std::cout << "New connection!!!!" << std::endl;
    }

    void on_close(websocketpp::connection_hdl hdl) {
        std::cout << "Connection closed!!!!" << std::endl;
    }

    void on_message(websocketpp::connection_hdl hdl, server::message_ptr msg) {
        std::cout << "Received message: " << msg->get_payload() << std::endl;
        m_server.send(hdl, msg->get_payload(), websocketpp::frame::opcode::text);
    }

    server m_server;
};

int main() {
    SwagServer server;
    server.run(8080);
    return 0;
}
