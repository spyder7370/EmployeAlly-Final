const { render } = require('ejs');
let express = require('express');
let router = express.Router();
//model
let Job = require('../models/job-DB.js');
let Notification = require('../models/notif-DB.js')
let {isLoggedIn, isAdmin} = require('../middlewares/index.js');

router.get('/', function(req, res){
    res.render('landing');
});

//index
router.get('/jobs', async function(req, res){
    //extract all the jobs from db
    try {
        let foundJobs= await Job.find({});
        console.log(req.user);
        res.render('index', {foundJobs})
    } catch (error) {
        console.log('error while extracting all jobs', error);
    }
});

//new (req,res)=> alternate for function
router.get('/jobs/new', isLoggedIn, isAdmin , (req, res)=>{
    res.render('new');
});

//create
router.post('/jobs', isLoggedIn, isAdmin, async (req, res)=>{
     
    //make a database object
    try {
        let newJob= new Job({
            name: req.body.name,
            address: req.body.address,
            image: req.body.image,
            package: req.body.package,
            cgpa: req.body.cgpa,
            deadline: req.body.deadline,
            discription: req.body.discription,
            type: req.body.type
        });
        await newJob.save();
        //! Push a new notification
        let newNotif = new Notification({
            body: 'A new job has been posted',
            author: newJob.name,
        });
        await newNotif.save();
        res.redirect('/jobs');
    } catch (error) {
        console.log('error while adding a new jobs', error); 
    }
});

//show
router.get('/jobs/:id', async (req, res)=>{
    try {
        //fetch the required job using id
        let id = req.params.id;
        let job= await Job.findById(id).populate('appliedUsers');
        res.render('show', {job});
    } catch (error) {
        console.log('error while fetching a jobs', error);
    }
});

//edit
router.get('/jobs/:id/edit', isLoggedIn, isAdmin, async (req, res)=>{
    try {
        //fetch the required job using id
        let id = req.params.id;
        let job= await Job.findById(id);
        res.render('edit', {job});
    } catch (error) {
        console.log('error while fetching a job for edit form.', error);
    }
})

//update
router.patch('/jobs/:id', isLoggedIn, isAdmin, async (req, res)=>{
    try {
        let id= req.params.id;
        let updateJob= {
            name: req.body.name,
            address: req.body.address,
            image: req.body.image,
            package: req.body.package,
            cgpa: req.body.cgpa,
            deadline: req.body.deadline,
            discription: req.body.discription,
            type: req.body.type
        };
        await Job.findByIdAndUpdate(id, updateJob);
        //! Push a new notification
        let newNotif = new Notification({
            body: 'A job has been updated',
            author: updateJob.name,
        });
        await newNotif.save();
        res.redirect(`/jobs/${id}`)
    } catch (error) {
        console.log('error while updating a job.', error);
    }
})

//delete
router.delete('/jobs/:id', isLoggedIn, isAdmin, async (req, res)=>{
    try {
        let id=req.params.id;
        await Job.findByIdAndDelete(id);
        res.redirect('/jobs');
    } catch (error) {
        console.log('error while deleting a job.', error);
    }
});

//apply in jobs
router.get('/jobs/:jobId/apply', isLoggedIn, async function(req, res){
    try {
        // if(!req.user.cgpa){
        //      return res.send('you have not entered your cgpa');
        // } ;
        let { jobId } = req.params;
        let job = await Job.findById(jobId);
        // if(req.user.cgpa < job.cgpa){
        //     return res.send('your cgpa is not enough');
        // }
        for(let user of job.appliedUsers){
            if(user._id.equals(req.user._id)){
                return res.send('you can apply only once');
            }
        }
        job.appliedUsers.push(req.user);
        await job.save();
        console.log(job);
        res.redirect(`/jobs/${jobId}`);
    } catch (error) {
        console.log('error while applying in job.', error);
    }
});

//for connection to main page
module.exports=router;