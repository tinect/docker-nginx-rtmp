const { spawn } = require('child_process');
const fastify = require('fastify')({ logger: true });
fastify.register(require('fastify-formbody'));

let processes = [];

fastify.post('/start', async (request, reply) => {
    let parts = request.body.name.split('__');
    let url = parts[0] + '://' + parts[1] + '/live/' + parts[2] + '/' + parts[3] + '/video.m3u8';

    //processes[request.body.name] = spawn('/usr/local/bin/ffmpeg', ['-i', url, '-map', '0', '-sn', '-c:v', 'copy', '-f', 'flv', 'rtmp://localhost:1935/live/' + request.body.name]);
    processes[request.body.name] = spawn('/usr/local/bin/ffmpeg', ['-re', '-i', url, '-acodec', 'copy', '-vcodec', 'copy', '-f', 'flv', 'rtmp://localhost:1935/live/' + request.body.name]);

    processes[request.body.name].stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    /*processes[request.body.name].stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    processes[request.body.name].on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });*/

    //console.log("Start FFMPEG");
    return {}
});

fastify.post('/stop', async (request, reply) => {
    processes[request.body.name].kill('SIGKILL');
    return {}
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()