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

router.get("/get/:courseId", async (req, res) => {
  const { courseId } = req.params; // Extract courseId from the URL

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      courseId: courseId, // Assuming courseId is the primary key
    },
  };

  try {
    const data = await dynamodb.get(params).promise();

    if (!data.Item) {
      // If no course is found with the given courseId
      return res.status(404).json({ error: "Course not found" });
    }

    // Add imageUrl to the course object
    const course = data.Item;
    const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${course.image}`;
    course.imageUrl = imageUrl;

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course from DynamoDB:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

router.get("/enrolled", async (req, res) => {
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

module.exports = router;
