const express = require("express");
const router = express.Router();
const prisma = require("../helper/prisma");
axios = require("axios");
const AWS = require("aws-sdk");

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
    const record = await prisma.enroll.findFirst({
      where: {
        courseId: String(req.body.enroll.courseId),
        userId: String(req.body.enroll.userId),
      },
    });

    if (record) {
      return res.status(409).send();
    }

    const result = await prisma.enroll.create({
      data: {
        courseId: String(req.body.enroll.courseId),
        userId: String(req.body.enroll.userId),
        paymentStatus: req.body.enroll.paymentStatus,
      },
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/get/enrolled/:userId", async (req, res) => {
  try {
    // Fetch the enrollment records from Prisma
    const records = await prisma.enroll.findMany({
      where: {
        userId: req.params.userId,
      },
    });

    // Prepare DynamoDB queries for each courseId
    const courseIds = records.map((record) => record.courseId);

    // Query DynamoDB for each courseId asynchronously
    const queryPromises = courseIds.map(async (courseId) => {
      const params = {
        TableName: process.env.DYNAMODB_TABLE, // DynamoDB table name
        Key: { courseId }, // Assuming 'courseId' is the partition key
      };

      try {
        // Query DynamoDB
        const data = await dynamodb.get(params).promise();

        // Check if course data exists
        if (!data.Item) {
          throw new Error(`Course with ID ${courseId} not found`);
        }

        // Remove the courseId field from the course object
        delete data.Item.courseId;

        // Add image URL to the course data
        const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${data.Item.image}`;
        data.Item.imageUrl = imageUrl;

        return data.Item; // Return course data with image URL
      } catch (err) {
        console.error(err);
        return null; // Return null if error occurs
      }
    });

    // Wait for all DynamoDB queries to complete
    const courseData = await Promise.all(queryPromises);

    // Combine Prisma records with corresponding course data
    const response = records.map((record, index) => {
      return {
        ...record,
        course: courseData[index], // Attach the corresponding course data from DynamoDB
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;
