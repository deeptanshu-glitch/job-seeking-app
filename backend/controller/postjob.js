import express from "express";
import job  from "../database/db.recruiter.js";
import auth from "../middleware.js";

const router = express.Router();

router.post("/postjob",auth, async(req, res) => {
try{

    const {title , description ,requirements , salary , experience , location ,jobtype ,position, company} = req.body;

    const userId = req.user._id;

    if(!title || !description || !requirements || !salary || !experience || !location || !jobtype || !position || !company ){
        return res.status(400).json({error:"All fields are required",status:false});
    }
    
    const job = await createImageBitmap({
    title,
    description,
    requirements: requirements.split(","),
    salary,
    experiencelevel : experience,
    location,
    jobtype,
    position,
    company: company,
    created_by: userId
})

} catch(error){
        console.log(error);
    }
});
 
 router.get("/getalljob",auth, async (req, res) => {
     try{
        const keyword =req.query.keyword || "";
        const query = {
            $or: [
              {title: { $regex: keyword, $options: "i" } },
              {description: { $regex: keyword, $options: "i" } },
              {requirements: { $regex: keyword, $options: "i" } },
              {salary: { $regex: keyword, $options: "i" } },
              {experiencelevel: { $regex: keyword, $options: "i" } },
              {location: { $regex: keyword, $options: "i" } },
              {jobtype: { $regex: keyword, $options: "i" } },
              {position: { $regex: keyword, $options: "i" } }
            ],
        }

        const jobs = await job.find(query);
        if (!jobs){
            return res.status(400).json({error:"No jobs found",status:false});
        }
        return res.status(201).json({ message: "Jobs fetched successfully",jobs, success: true});

     }catch (error){
         console.log(error);
         return res.status(500).json({error:"Server error",status:false});
     }
 })


 
 router.get("/getjobbyid/:id", async (req, res) => {
     try{
        const jobId = req.params.id;
        const job = await recruition.findById(jobId);
        if (!job){
            return res.status(400).json({error:"Job not found",status:false});
        }
     }catch (error){
         console.log(error);
     }
 })

 router.put("/getalljobs/:adminId", async (req, res) => {
     try{
        const adminId = req.user._id;
        const jobs = await Recruition.find({created_by: adminId});
        if (!jobs){
            return res.status(400).json({error:"No jobs found",status:false});
        }

     }catch (error){
         console.log(error);
     }
 })

export default router;