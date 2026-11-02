const socket = new WebSocket("ws://localhost:8000");

export const connectMarketSocket = (onMarketUpdate) => {
    socket.onopen = () => {
        console.log("Connected to TMRX market server");
    };

    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);

            if (message.type === "market-update") {
                onMarketUpdate(message.data);
            }
        } catch (error) {
            console.error("Market data error:", error);
        }
    };

    socket.onerror = (error) => {
        console.error("Market socket error:", error);
    };

    socket.onclose = () => {
        console.log("Market socket disconnected");
    };
};

export default socket;