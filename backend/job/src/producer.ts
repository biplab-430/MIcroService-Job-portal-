import { Kafka, Producer, Admin } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {

    try {

        const kafka = new Kafka({

            clientId: "job-service",

            brokers: [
                process.env.KAFKA_AIVEN_BROKER as string
            ],

            ssl: {
                rejectUnauthorized: false,
            },

            sasl: {
                mechanism: "plain",

                username:
                    process.env.KAFKA_USERNAME as string,

                password:
                    process.env.KAFKA_PASSWORD as string,
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
                        replicationFactor: 3,
                    }
                ]
            });

            console.log(
                "💚💚 topic 'send-mail' created "
            );
        }

        await admin.disconnect();

        producer = kafka.producer();

        await producer.connect();

        console.log(
            "💚💚 connected to cloud kafka producer aiven via sasl "
        );

    } catch (error) {

        console.log(
            "☠️☠️ Error connecting to kafka producer",
            error
        );
    }
};

export const publishToTopic = async (
    topic: string,
    message: any
) => {

    if (!producer) {

        console.log(
            "☠️☠️ kafka producer is not initialized"
        );

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

        console.log(
            "☠️☠️ Error publishing to kafka topic ",
            error
        );
    }
};

export const disConnectKafka = async () => {

    if (producer) {

        await producer.disconnect();

        console.log(
            "💚💚 Disconnected from kafka producer"
        );
    }
};