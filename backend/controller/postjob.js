import express from "express";
import job  from "../database/db.recruiter.js";
import auth from "../middleware.js";

const router = express.Router();

router.post("/postjob",auth, async(req, res) => {
try{

    const {title , description ,requirements , salary , experience , location ,jobtype ,position, company} = req.body;

    const userId = req.user._id;

    const reqList = Array.isArray(requirements) ? requirements : (requirements ? requirements.split(",") : []);

    if(!title || !description || !salary || !experience || !location || !jobtype || !position || !company ){
        return res.status(400).json({error:"All fields are required",status:false});
    }
    
    const newJob = await job.create({
      title,
      description,
      requirements: reqList, 
      salary,
      experience,
      location,
      jobtype,
      position,
      company,
      created_by: userId
    });
    return res.status(201).json({ message: "Job created successfully", job: newJob, success: true });
} catch(error){
        console.log(error);
    }
});
 
 router.get("/getalljob",auth, async (req, res) => {
     try{
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
              {title: { $regex: keyword, $options: "i" } },
              {description: { $regex: keyword, $options: "i" } },
              {requirements: { $regex: keyword, $options: "i" } },
              {salary: { $regex: keyword, $options: "i" } },
              {experience: { $regex: keyword, $options: "i" } },
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
        const sinjob = await recruition.findById(jobId);
        if (!sinjob){
            return res.status(400).json({error:"Job not found",status:false});
        }
     }catch (error){
         console.log(error);
     }
 })

 router.get("/getalljobs", auth, async (req, res) => {
     try{
        const adminId = req.user._id;
        const jobs = await job.find({created_by: adminId});
        if (!jobs){
            return res.status(400).json({error:"No jobs found",status:false});
        }
        return res.status(200).json({ jobs, success: true });

     }catch (error){
         console.log(error);
     }
 })

export default router;