const { spawn } = require('child_process');
const fastify = require('fastify')({ logger: true });
fastify.register(require('fastify-formbody'));

let processes = [];

fastify.post('/start', async (request, reply) => {

    let url = request.body.name;

    const searchParams = new URLSearchParams()

    if (request.body['token']) {
        searchParams.append('token', request.body['token'])
    }

    if (request.body['sd']) {
        searchParams.append('sd', request.body['sd'])
    }

    if (request.body['rebase']) {
        searchParams.append('rebase', request.body['rebase'])
    }

    if (searchParams.toString() !== '') {
        url += '?' + searchParams.toString();
    }

    processes[request.body.name] = spawn('/usr/local/bin/ffmpeg', ['-i', url, '-map', '0', '-sn', '-c:v', 'copy', '-f', 'flv', 'rtmp://localhost:1935/live/' + url]);

    /*processes[request.body.name].stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    processes[request.body.name].stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
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