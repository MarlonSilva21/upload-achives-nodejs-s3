const routes = require('express').Router();
const multer = require('multer');
const  multerConfig = require('./config/multer')

const Post = require('./models/post')

routes.get('/posts', async (req, res) => {
    const posts = await Post.find();

    return res.json(posts);
})

routes.post('/posts', multer(multerConfig).single('file'), async (req, res) => {
    const { originalname: name, size, key, location: url = "" } = req.file;

    const post = await Post.create({
        name,
        size,
        key,
        url,
    })

    return res.json(post)
})

routes.delete('/posts/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);

    try{
        if(!post)
            return res.status(400).send({ error: 'this file does not exist'});
        else{
            await post.remove();
        }
    }
    catch (err){
        return res.status(400).send({ error: 'error deleting, try again'});
    }

    return res.send();
})

module.exports = routes;
