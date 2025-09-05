#
#
#  Obtain all ticker symbols and save to a file
#  Used to validate a ticker
#
#  Obtain ticker list from nasdaq.com web site
#  periodically refresh it
#

import os
import requests

def refreshTickers(fname):
    """
    Refresh ticker symbols from a web source
    Note: You need to specify the actual URL for your ticker data source
    """
    url = "your_url_here"  # You need to specify the URL
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.text
        name = fname + "raw"
        with open(name, "w") as f:
            f.write(data)
        return True
    except requests.RequestException as e:
        print(f"Error fetching ticker data: {e}")
        return False

def isValidTicker(s):
    """
    Check if a ticker symbol is valid by looking it up in the nasdaq.txt file
    """
    tickers = {}
    print("loading tickers...")
    try:
        with open(os.path.join(os.path.dirname(__file__), "nasdaq.txt")) as f:
            data = f.read()
    except FileNotFoundError:
        print("Warning: nasdaq.txt file not found")
        return False
    
    datalist = data.split("\n")
    # print(len(datalist))
    for i in datalist:
        if i != "":
            j = i.split(",")
            if j[0] != "":
                sym = j[0].replace('"', "")
                # print("adding "+sym)
                tickers[sym] = sym

    s1 = s.upper()
    return tickers.get(s1) is not None


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        print(isValidTicker(sys.argv[1]))
        print(isValidTicker(sys.argv[2]))
    else:
        print("Usage: python tickersymbols.py <ticker1> <ticker2>")