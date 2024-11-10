import asyncio
import socketio

sio = socketio.AsyncClient()

appKey = '1'

@sio.on('connect', namespace='/subscriptions')
async def connect():
    print('connected to server ' + sio.sid)

    await sio.emit('get-app-list', {'appKey': appKey}, namespace='/subscriptions')
    print('get-app emitted')


@sio.event
async def disconnect():
    print('disconnected from server')

@sio.event
async def message(data):
    print('I received a message!')

@sio.on('discover', namespace='*')
def discover(data):
    print(data)

@sio.on(f'app-{appKey}', namespace='/subscriptions')
def hello(data):
    print(data)

@sio.on(f'subscriptions-{appKey}', namespace='/subscriptions')
def handle_subscriptions(data):
    print(data)


async def start_server():
    try:
        await sio.connect('http://localhost:3001/subscriptions', namespaces=['/subscriptions'])
        await sio.wait()
    except KeyboardInterrupt:
        await sio.disconnect()


if __name__ == '__main__':
        asyncio.run(start_server())