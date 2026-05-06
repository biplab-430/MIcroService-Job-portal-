import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.kafka_Broker || "localhost:9092"],
    });

    const consumer = kafka.consumer({
      groupId: "mail-service-group",
    });

    await consumer.connect();
    await consumer.subscribe({
      topic: "send-mail",
      fromBeginning: false,
    });

    console.log("💚💚 connected to kafka consumer");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          console.log("MSG:", message.value?.toString()); // ✅ check kafka

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
            from: `"Hire heaven" <${process.env.EMAIL_USER}>`, // ✅ FIXED
            to,
            subject,
            html,
          });

          console.log("Mail sent:", info.response); // ✅ log result
        } catch (error) {
          console.error("Error sending mail:", error);
        }
      },
    });
  } catch (error) {
    console.error("Error starting kafka consumer:", error);
  }
};

// import { Kafka, PartitionAssigners } from "kafkajs";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// export const startSendMailConsumer = async () => {
//     try {
//         const kafka = new Kafka({
//             clientId: "mail-service",
//             brokers: [process.env.kafka_Broker || "localhost:9092"],
//         });
//         const consumer = kafka.consumer({
//             groupId: "mail-service-group",
//         });
//         await consumer.connect();
//         await consumer.subscribe({
//             topic: "send-mail",
//             fromBeginning: false
//         })
//         console.log("💚💚connnected to kafka consumer");

//         await consumer.run({
//             eachMessage: async ({
//                 topic,
//                 partition,
//                 message
//             }) => {
//                 try {
//                     const { to, subject, html } = JSON.parse(message.value?.toString() || "{}");

//                     const transporter = nodemailer.createTransport({
//                         host: "smtp.gmail.com",
//                         port: 465,
//                         secure: true,
//                         auth: {
//                             user: process.env.EMAIL_USER,
//                             pass: process.env.EMAIL_PASS,
//                         }
//                     });

//                     await transporter.sendMail({
//                         from: "Hire heaven <no-reply>",
//                         to,
//                         subject,
//                         html
//                     })

//                     console.log(`Mail has been sent to ${to}`);
//                 } catch (error) {
//                     console.error("Error to send mail  message:", error);
//                 }
//             }
//         })
//     } catch (error) {
//         console.error("Error starting kafka consumer:", error);
//     }
// } 