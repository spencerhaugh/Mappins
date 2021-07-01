const user = {
    _id: "1",
    name: "Spencer",
    email: "spencer.haugh@gmail.com",
    picture: "https://randomuser.me/api/portraits/lego/8.jpg"

}


module.exports = {
    Query: {
        me: () => user
    }
}