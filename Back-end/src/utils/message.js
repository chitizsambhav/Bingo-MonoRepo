const generateMessage = (text,username)=>{
    return {
        username: username,
        text: text,
        createdAt : new Date().getTime()
    }
}


module.exports = {
    generateMessage
}