/*
 - Is this setup actually needed?
 - Well.... No (YAGNI applies) :)
 - Why is it here then?
 - TBH, was looking for an excuse to play around extension background service workers. (^_^;)
*/

export type RPCRequest<TArgs = unknown[]> = { id: string, task: string, args: TArgs }
export type RPCResult<TResult = unknown> = { id: string, task: string, result: TResult }
export type RPCRequestPayload = { id: string, args: string }
export type RPCResponsePayload = { id: string, result: string }
