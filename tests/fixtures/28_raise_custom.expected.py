def validate(n):
    if n < 0:
        raise ValueError("n must be non-negative")
    return n

try:
    r = validate(0 - 5)
    print(r)
except ValueError as e:
    print(e)
