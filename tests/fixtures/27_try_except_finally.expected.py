result = 0
try:
    ignored = 10 / 0
except ZeroDivisionError:
    result -= 1
finally:
    result = result + 100
print(result)
