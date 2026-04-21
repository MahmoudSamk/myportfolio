list_num_divisible_by_9 =[]
list_num_divisible_by_4 =[]
list_No = []

for i in range (1500,2700):
  if i % 9 == 0:
    i.append(list_num_divisible_by_9)
  elif i % 4 == 0:
    i.append(list_num_divisible_by_4)
  else:
    i.append(list_No)

print (list_num_divisible_by_9)
print (list_num_divisible_by_4)
print (list_No)

