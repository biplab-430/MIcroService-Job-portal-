import { Kafka, Producer, Admin } from "kafkajs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// path.resolve() identifies the executing directory of this specific microservice (e.g., backend/auth)
// We back out one level using "../certs/" to query the global workspace shared keys safely
const rootDir = path.resolve(); 
const caCertPath = path.join(rootDir, "../certs/ca.pem");
const userCertPath = path.join(rootDir, "../certs/service.cert");
const userKeyPath = path.join(rootDir, "../certs/service.key");

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
            clientId: "auth-service",
            brokers: [process.env.KAFKA_AIVEN_BROKER as string],
            ssl: {
                rejectUnauthorized: true,
                ca: [fs.readFileSync(caCertPath, "utf-8")],
                cert: fs.readFileSync(userCertPath, "utf-8"),
                key: fs.readFileSync(userKeyPath, "utf-8"),
            },
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
        console.log("💚💚 connected to cloud kafka producer aiven");

    } catch (error) {
        console.log("☠️☠️ Error connecting to kafka producer", error);
    }
};

export const publishToTopic = async (topic: string, message: any) => {
    if (!producer) {
        console.log("☠️☠️ kafka producer is not initialized");
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
    } catch (error) {
        console.log("☠️☠️ Error publishing to kafka topic ", error);
    }
};

export const disConnectKafka = async () => {
    if (producer) {
        await producer.disconnect();
        console.log("💚💚 Disconnected from kafka producer");
    }
};