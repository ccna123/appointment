const express = require("express")
const router  = express.Router()
const prisma = require("../helper/prisma")

router.get("/getAllUserAppoint", async(req, res)=>{
    try {
        const records = await prisma.appointment.findMany({
            include: {
                user: {
                    select: {
                        id: true, 
                        name: true,
                        role: true
                    }
                }
            }
        })
    
        return res.status(200).send(records)
    } catch (error) {
        console.error(error);
    }
})

router.put("/updateAppointStatus", async (req, res) => {
  try {
    const record = await prisma.appointment.update({
      where: {
        id: req.body.appointId,
        userId: req.body.userId,
      },
      data: {
        status: "confirmed",
      },
    });
    return res.status(200).send(record);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router