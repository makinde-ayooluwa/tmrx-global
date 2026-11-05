import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { backendUrl } from "../constants/backendUrl";

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
    const [markets, setMarkets] = useState([]);
    const [connected, setConnected] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [supportedNetworks, setSupportedNetworks] = useState([]);
    const fetchSupportedNetworks = async () => {
        try {
            const response = await fetch(`${backendUrl}/bybit/networks`);
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                // Convert the array into an object mapping symbols to their networks array
                const networksMap = {};
                data.data.forEach((item) => {
                    networksMap[item.symbol] = item.networks;
                });

                setSupportedNetworks(networksMap);
            }
        } catch (error) {
            console.error("Supported networks fetch error:", error);
        }
    };
    const fetchExchangeRate = async () => {
        try {
            const response = await fetch(
                `${backendUrl}/currency/usd-ngn`
            );

            const data = await response.json();

            if (data.success) {
                setExchangeRate(data.rate);
            }
        } catch (error) {
            console.error("Exchange rate error:", error);
        }
    };
    fetchSupportedNetworks();
    fetchExchangeRate();
    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8000");

        socket.onopen = () => {
            console.log("Connected to TMRX market server");
            setConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type !== "market-update") return;

                const ticker = message.data?.data;

                if (!ticker?.symbol) return;

                setMarkets((previousMarkets) => {
                    const exists = previousMarkets.some(
                        (item) => item.symbol === ticker.symbol
                    );

                    if (exists) {
                        return previousMarkets.map((item) =>
                            item.symbol === ticker.symbol
                                ? { ...item, ...ticker }
                                : item
                        );
                    }

                    return [...previousMarkets, ticker];
                });

            } catch (error) {
                console.error("Market update error:", error);
            }
        };

        socket.onclose = () => {
            setConnected(false);
        };

        socket.onerror = (error) => {
            console.error("Market socket error:", error);
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <MarketContext.Provider
            value={{
                markets,
                connected,
                exchangeRate,
                supportedNetworks
            }}
        >
            {children}
        </MarketContext.Provider>
    );
};

export const useMarket = () => {
    const context = useContext(MarketContext);

    if (!context) {
        throw new Error(
            "useMarket must be used inside MarketProvider"
        );
    }

    return context;
};