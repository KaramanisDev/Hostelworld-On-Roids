/*
 - Is this setup actually needed?
 - Well.... No (YAGNI applies) :)
 - Why is it here then?
 - TBH, was looking for an excuse to play around extension background service workers. (^_^;)
*/

export type RPCRequest<TArgs = unknown[]> = { task: string, args: TArgs }
export type RPCResult<TResult = unknown> = { task: string, result: TResult }
