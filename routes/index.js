const express = require('express');
const router = express.Router();
const {login,register,Access_User,updateSessionStatus,setSessionInactive,addOrUpdateAction} = require("../services/userServices")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/login', login)
router.post('/resgister', register)
router.post('/Access',Access_User)
router.post('/updateSessionStatus', updateSessionStatus);
router.post('/setSessionInactive',setSessionInactive)
router.post("/Action",addOrUpdateAction)
module.exports = router;
