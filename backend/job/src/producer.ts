import { Kafka, Producer, Admin } from "kafkajs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Resolve paths to the certificate files in your shared certs folder
const rootDir = path.resolve(); 
const caCertPath = path.join(rootDir, "../certs/ca.pem");
const userCertPath = path.join(rootDir, "../certs/service.cert");
const userKeyPath = path.join(rootDir, "../certs/service.key");

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {
    try {
         const kafka = new Kafka({
            clientId: "auth-service", // You can keep this as auth-service or change it
            brokers: [process.env.KAFKA_AIVEN_BROKER as string], // Now pointing to your cloud broker
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
}

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
}


//kafka produceer through docker container //////////////////////////////////////////////////////////////////

// import { Kafka,Producer,Admin } from "kafkajs";
// import dotenv from "dotenv";
// dotenv.config();

// let producer:Producer;
// let admin:Admin;

// export const connectKafka=async()=>{
//     try {
//          const kafka = new Kafka({
//             clientId: "auth-service",
//             brokers: [process.env.kafka_Broker || "localhost:9092"],
//         });

//         admin=kafka.admin();
//         await admin.connect();

//         const topics=await admin.listTopics();

//         if(!topics.includes("send-mail")){
//             await admin.createTopics({
//                 topics:[
//                     {
//                         topic:"send-mail",
//                         numPartitions:1,
//                         replicationFactor:1,

//                     }
//                 ]
//             })
//             console.log("💚💚 topic 'send-mail' created ");
//         }
//         await admin.disconnect();

//         producer=kafka.producer()
//         await producer.connect();
//         console.log("💚💚connnected to kafka producer")

//     } catch (error) {
//         console.log("☠️☠️Error connecting to kafka producer",error);
//     }
// }

// export const publishToTopic=async(topic:string,message:any)=>{
//     if(!producer){
//         console.log("☠️☠️kafka producer is not initialized");
//         return;
//     }
//     try {
//         await producer.send({
//             topic:topic,
//             messages:[
//                 {
//                     value:JSON.stringify(message)
//                 }
//             ]
//         })
//     } catch (error) {
//         console.log("☠️☠️Error publishing to kafka topic ",error);
//     }
// };

// export const disConnectKafka=async()=>{
//     if(producer){
//         await producer.disconnect();
//         console.log("💚💚Disconnected from kafka producer");
//     }
//     

// }

//     