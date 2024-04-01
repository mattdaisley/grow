import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { last, map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

let insertedIds = []
let insertedMessages = {}
let lastIndex = -1;

@WebSocketGateway({
  namespace: 'subscriptions',
  cors: {
    origin: '*',
  }
})

export class SubscriptionsGateway {
  @WebSocketServer()
  server: Server;


  constructor() {
    const timer = setInterval(() => {

      let typeIndex = Math.floor(Math.random() * 3);
      if (insertedIds.length === 0) {
        typeIndex = 0;
      }
      // let typeIndex = (lastIndex + 1) % 3;
      lastIndex = typeIndex;

      const wordsList = [
        'apple', 'banana', 'cherry', 'date', 'elderberry',
        'fig', 'grape', 'honeydew', 'iceberg', 'jackfruit',
        'kiwi', 'lemon', 'mango', 'nectarine', 'orange',
        'pineapple', 'quince', 'raspberry', 'strawberry', 'tomato',
        'ugli', 'victoria', 'watermelon', 'xigua', 'yellow',
        'zucchini'
      ];

      const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];

      let message;
      if (typeIndex === 0) {
        const id = `${uuidv4()}`;
        message = {
          i: {
            'collectionKey': '1_0',
            'records': {
              [id]: {
                "f_1_0_0": "plugin-page-v1",
                "f_1_0_1": randomWord.charAt(0).toUpperCase() + randomWord.slice(1),
                "f_1_0_2": `/${randomWord}`,
                "f_1_0_3": "2_0"
              }
            }
          }
        }
        insertedIds.push(id)
        insertedMessages[id] = message;
      }
      if (typeIndex === 1 && insertedIds.length > 0) {
        const idToUpdate = insertedIds[Math.floor(Math.random() * insertedIds.length)];
        message = { u: {
            'collectionKey': '1_0',
            'records': {
              [idToUpdate]: {
                "f_1_0_0": "plugin-page-v1",
                "f_1_0_1": randomWord.charAt(0).toUpperCase() + randomWord.slice(1),
                "f_1_0_2": `/${randomWord}`,
                "f_1_0_3": "2_0"
              }
            }
          }
        }
      }
      if (typeIndex === 2 && insertedIds.length > 0) {
        const idToDelete = insertedIds[Math.floor(Math.random() * insertedIds.length)];
        message = { d: {
            'collectionKey': '1_0',
            'records': {
              [idToDelete]: {}
            }
          }
        }
        insertedIds.splice(insertedIds.indexOf(idToDelete), 1)
      }

      console.log('subscriptions', typeIndex, randomWord)
      if (message) {
        this.server.emit('subscriptions', message );
      }
    }, 5000);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    insertedIds = []
    insertedMessages = {}
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    client.emit('discover')
  }


  @SubscribeMessage('get-app')
  async handleGetAppEvent(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ): Promise<any> {

    const data = JSON.parse(fs.readFileSync('./src/subscriptions/data.json', 'utf8'));

    console.log('handleGetAppEvent', body, data)
    const event = `app-${body.appKey}`;

    const response = { key: body.appKey, ...data.apps[body.appKey]};
    // console.log(dynamicItems)

    console.log('handleGetAppEvent returning', event)
    client.emit(event, response)
    return response;
  }
}