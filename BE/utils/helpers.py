import datetime

def format_currency(amount):
    return "{:,.0f} VNĐ".format(amount)

def get_now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")