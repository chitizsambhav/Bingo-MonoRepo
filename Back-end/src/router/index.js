const express = require('express')
const router = express.Router()

router.get('/', (req,res)=>{
    res.send({
        data:'hello world'
    })
})

module.exports = router
  