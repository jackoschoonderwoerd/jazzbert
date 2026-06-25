import { Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

@Injectable({ providedIn: 'root' })
export class PingService {
  async ping(name: string) {
    const fn = httpsCallable<{ name: string }, { message: string; at: string }>(
      functions,
      'ping'
    );
    const result = await fn({ name });
    return result.data;
  }
}

// import { Injectable } from '@angular/core';
// import { httpsCallable } from 'firebase/functions';
// import { functions } from './firebase';

// @Injectable({ providedIn: 'root' })
// export class PingService {
//   async ping(name: string) {
//     const callable = httpsCallable<{ name: string }, { message: string; at: string }>(
//       functions,
//       'ping'
//     );
//     const result = await callable({ name });
//     return result.data;
//   }
// }

// import { Injectable } from '@angular/core';
// import { httpsCallable } from 'firebase/functions';
// import { functions } from './firebase';

// type PingRequest = {
//   name: string;
// };

// type PingResponse = {
//   message: string;
//   at: string;
// };

// @Injectable({ providedIn: 'root' })
// export class PingService {
//   async ping(name: string): Promise<PingResponse> {
//     const callable = httpsCallable<PingRequest, PingResponse>(functions, 'ping');
//     const result = await callable({ name });
//     return result.data;
//   }
// }