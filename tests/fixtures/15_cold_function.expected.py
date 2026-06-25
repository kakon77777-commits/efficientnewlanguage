import functools

@functools.cache
def square_sum(N):
    r = sum(i**2 for i in range(1, N+1))
    return r

total = square_sum(100)
print(total)
