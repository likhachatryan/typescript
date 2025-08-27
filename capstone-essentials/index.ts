enum UserRole {
  User = 'user',
  Admin = 'admin',
}

enum HttpMethod {
  Post = 'POST',
  Get = 'GET',
}

enum HttpStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

type UserType = {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleated: boolean;
};

type ObserverHandlersType<T> = {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

type SubscribeFnType<T> = (observer: Observer<T>) => UnsubscribeFnType;
type UnsubscribeFnType = () => void;

type SubscriptionFnReturnType = {
  unsubscribe(): void;
};

type RequestParamsType = Record<string, string>;

type RequestType = {
  method: HttpMethod;
  host: string;
  path: string;
  body?: UserType;
  params: RequestParamsType;
};

type ResponseType = {
  status: HttpStatus;
};

class Observer<T> {
  private isUnsubscribed: boolean;
  public _unsubscribe?: UnsubscribeFnType;

  constructor(private handlers: ObserverHandlersType<T>) {
    this.isUnsubscribed = false;
  }

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: Error): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe(): void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable<T> {
  private _subscribe: SubscribeFnType<T>;

  constructor(subscribe: SubscribeFnType<T>) {
    this._subscribe = subscribe;
  }

  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer: Observer<T>) => {
      values.forEach(value => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: ObserverHandlersType<T>): SubscriptionFnReturnType {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: UserType = {
  name: 'User Name',
  age: 26,
  roles: [UserRole.User, UserRole.Admin],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: RequestType[] = [
  {
    method: HttpMethod.Post,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HttpMethod.Get,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s',
    },
  },
];

const handleRequest = (request: RequestType): ResponseType => {
  // handling of request
  return { status: HttpStatus.OK };
};
const handleError = (error: Error): ResponseType => {
  // handling of error
  return { status: HttpStatus.INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
