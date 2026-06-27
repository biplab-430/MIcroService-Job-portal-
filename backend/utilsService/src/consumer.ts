import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const startSendMailConsumer = async () => {

  try {

    const kafka = new Kafka({

      clientId: "mail-service",

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

    const consumer = kafka.consumer({
      groupId: "mail-service-group",
    });

    await consumer.connect();

    await consumer.subscribe({
      topic: "send-mail",
      fromBeginning: false,
    });

    console.log(
      "💚💚 connected to cloud kafka consumer aiven via sasl "
    );

    await consumer.run({

      eachMessage: async ({ message }) => {

        try {

          console.log(
            "MSG RECEIVED:",
            message.value?.toString()
          );

          const {
            to,
            subject,
            html
          } = JSON.parse(
            message.value?.toString() || "{}"
          );

          const transporter =
            nodemailer.createTransport({

              host: "smtp.gmail.com",

              port: 465,

              secure: true,

              pool: true,

              tls: {
                rejectUnauthorized: false,
              },

              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

          await transporter.verify();

          console.log("SMTP ready");

          const info =
            await transporter.sendMail({

              from:
                `"Hire Heaven" <${process.env.EMAIL_USER}>`,

              to,

              subject,

              html,
            });

          console.log(
            "✅ Mail sent successfully:",
            info.response
          );

        } catch (error) {

          console.error(
            "❌ Error sending mail:",
            error
          );
        }
      },
    });

  } catch (error) {

    console.error(
      "❌ Error starting kafka consumer:",
      error
    );
  }
};