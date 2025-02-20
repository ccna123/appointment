const express = require("express");
const router = express.Router();
const prisma = require("../helper/prisma");
const AWS = require("aws-sdk");
const enrollSchema = require("../model/enrollSchema");
const axios = require("axios");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamodb = new AWS.DynamoDB.DocumentClient();

router.get("/get", async (req, res) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const courses = data.Items;

    const coursesWithImageUrls = courses.map((course) => {
      const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${course.image}`;
      course.imageUrl = imageUrl;
      return course;
    });
    res.status(200).json(coursesWithImageUrls);
  } catch (error) {
    console.error("Error fetching items from DynamoDB:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

router.post("/enroll", async (req, res) => {
  try {
    const { userId, course } = req.body.enroll;
    const existingRecord = await enrollSchema.findOne({
      userId: userId,
      "course.courseId": course.courseId,
    });

    if (existingRecord) {
      return res.status(409).send();
    }
    const newRecord = await enrollSchema.create(req.body.enroll);
    return res.status(201).json(newRecord);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/get/enrolled", async (req, res) => {
  try {
    const records = await enrollSchema.find({
      userId: req.query.userId,
    });

    if (records) {
      return res.status(200).send(records);
    } else {
      return res.status(404).json();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const { id, userId, courseId } = req.body;

    const result = await enrollSchema.findOneAndDelete({
      _id: id,
      userId: userId,
      "course.courseId": courseId,
    });

    if (!result) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    return res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
