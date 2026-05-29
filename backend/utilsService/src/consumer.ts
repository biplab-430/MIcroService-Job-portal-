import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

// path.resolve() points to the root of the utilsService
// We use "../certs/" to go up one level into the shared certs folder
const rootDir = path.resolve(); 
const caCertPath = path.join(rootDir, "../certs/ca.pem");
const userCertPath = path.join(rootDir, "../certs/service.cert");
const userKeyPath = path.join(rootDir, "../certs/service.key");

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_AIVEN_BROKER as string], // E.g., kafka-4d38...aivencloud.com:26397
      ssl: {
        rejectUnauthorized: true,
        ca: [fs.readFileSync(caCertPath, "utf-8")],
        cert: fs.readFileSync(userCertPath, "utf-8"),
        key: fs.readFileSync(userKeyPath, "utf-8"),
      },
    });

    const consumer = kafka.consumer({
      groupId: "mail-service-group",
    });

    await consumer.connect();
    await consumer.subscribe({
      topic: "send-mail",
      fromBeginning: false,
    });

    console.log("💚💚 connected to cloud kafka consumer aiven ");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          console.log("MSG RECEIVED:", message.value?.toString()); // ✅ check kafka payload

          const { to, subject, html } = JSON.parse(
            message.value?.toString() || "{}"
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.verify(); // ✅ check smtp
          console.log("SMTP ready");

          const info = await transporter.sendMail({
            from: `"Hire Heaven" <${process.env.EMAIL_USER}>`, 
            to,
            subject,
            html,
          });

          console.log("✅ Mail sent successfully:", info.response); 
        } catch (error) {
          console.error("❌ Error sending mail:", error);
        }
      },
    });
  } catch (error) {
    console.error("❌ Error starting kafka consumer:", error);
  }
};

// kafka consumer throgh docker container /////////////////////////////////////////////////////////////

// import { Kafka } from "kafkajs";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// export const startSendMailConsumer = async () => {
//   try {
//     const kafka = new Kafka({
//       clientId: "mail-service",
//       brokers: [process.env.kafka_Broker || "localhost:9092"],
//     });

//     const consumer = kafka.consumer({
//       groupId: "mail-service-group",
//     });

//     await consumer.connect();
//     await consumer.subscribe({
//       topic: "send-mail",
//       fromBeginning: false,
//     });

//     console.log("💚💚 connected to kafka consumer");

//     await consumer.run({
//       eachMessage: async ({ message }) => {
//         try {
//           console.log("MSG:", message.value?.toString()); // ✅ check kafka

//           const { to, subject, html } = JSON.parse(
//             message.value?.toString() || "{}"
//           );

//           const transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com",
//             port: 465,
//             secure: true,
//             auth: {
//               user: process.env.EMAIL_USER,
//               pass: process.env.EMAIL_PASS,
//             },
//           });

//           await transporter.verify(); // ✅ check smtp
//           console.log("SMTP ready");

//           const info = await transporter.sendMail({
//             from: `"Hire heaven" <${process.env.EMAIL_USER}>`, // ✅ FIXED
//             to,
//             subject,
//             html,
//           });

//           console.log("Mail sent:", info.response); // ✅ log result
//         } catch (error) {
//           console.error("Error sending mail:", error);
//         }
//       },
//     });
//   } catch (error) {
//     console.error("Error starting kafka consumer:", error);
//   }
// };