import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();
let producer;
let admin;
export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
            clientId: "auth-service",
            brokers: [process.env.kafka_Broker || "localhost:9092"],
        });
        admin = kafka.admin();
        await admin.connect();
        const topics = await admin.listTopics();
        if (!topics.includes("send-mail")) {
            await admin.createTopics({
                topics: [
                    {
                        topic: "send-mail",
                        numPartitions: 1,
                        replicationFactor: 1,
                    }
                ]
            });
            console.log("💚💚 topic 'send-mail' created ");
        }
        await admin.disconnect();
        producer = kafka.producer();
        await producer.connect();
        console.log("💚💚connnected to kafka producer");
    }
    catch (error) {
        console.log("☠️☠️Error connecting to kafka producer", error);
    }
};
export const publishToTopic = async (topic, message) => {
    if (!producer) {
        console.log("☠️☠️kafka producer is not initialized");
        return;
    }
    try {
        await producer.send({
            topic: topic,
            messages: [
                {
                    value: JSON.stringify(message)
                }
            ]
        });
    }
    catch (error) {
        console.log("☠️☠️Error publishing to kafka topic ", error);
    }
};
export const disConnectKafka = async () => {
    if (producer) {
        await producer.disconnect();
        console.log("💚💚Disconnected from kafka producer");
    }
};
