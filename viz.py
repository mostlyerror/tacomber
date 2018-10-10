
#!/usr/bin/env python3

import sys
import os
import csv
import json
import pprint
from matplotlib import pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401 unused import
import numpy as np


from decimal import Decimal


pp = pprint.PrettyPrinter(indent=4)
csv_path = sys.argv[1]
if csv_path == None:
    print('You must provide CSV_PATH arg')
    sys.exit(1)

csv_exists = os.path.isfile(csv_path)
if not csv_exists:
    print(f'Unable to find csv: {csv_path}')
    sys.exit(1)


def extract_price(car):
    if 'price' in car and len(car['price']) > 2:
        try:
            return int(Decimal(car['price'].strip('$')))
        except:
            print('!!!!!!!')
            print(car['price'])
    return None

def extract_age(car):

def extract_mileage(meta_json):
    meta = json.loads(meta_json)
    if 'mileage' in meta:
        return int(Decimal(meta['mileage']))
    if 'odometer' in meta:
        return int(Decimal(meta['odometer']))
    return None

data = []
price_data = []
mileage_data = []
age_data = []
with open(csv_path) as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    data = []
    for row in csv_reader:
        line_count += 1
        if line_count == 1:
            header_row = row
            print(f'Column names are {", ".join(row)}')
        else:
            line_count += 1
            car = (dict(zip(header_row, row)))
            price = extract_price(car)
            if price == None:
                pass
            else:
                mileage = extract_mileage(car['meta'])
                if mileage == None:
                    pass
                else: 
                    data.append((price, mileage))
                    price_data.append(price)
                    mileage_data.append(mileage)



# pp.pprint(price_data)
print(f'{len(price_data)} prices found')

# pp.pprint(mileage_data)
print(f'{len(mileage_data)} mileages found')

print(f'{len(data)} pairs found')

def plot():
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    ax.scatter(mileage_data, price_data, age_data)
    plt.show()


plot()
