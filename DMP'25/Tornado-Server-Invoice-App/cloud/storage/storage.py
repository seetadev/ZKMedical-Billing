"""
Cloud Storage Infrastructure

using amazon S3 with boto3
"""

import os
import boto3
import json
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

load_dotenv()

# S3 client initialization
# Note: It's recommended to use environment variables or IAM roles for credentials
# instead of hardcoding them in the code
try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    s3_resource = boto3.resource(
        's3',
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
except NoCredentialsError:
    print("Error: AWS credentials not found")
    s3_client = None
    s3_resource = None

AspiringStorageBucket = os.getenv("S3_BUCKET_NAME")

print("Starting cloud import")

#
# The following are the base ITEM key, value APIs
#    Using this key,value storage is built a
#    user storage metaphor
#


# store a user item
# returns True/False
def putItem(path, filedata, overwrite=True):
    try:
        if isinstance(filedata, str):
            filedata = filedata.encode('utf-8')

        s3_client.put_object(
            Bucket=AspiringStorageBucket,
            Key=path,
            Body=filedata
        )
        return True
    except ClientError as e:
        print(f"Error putting item: {e}")
        return False


# get a user item
# returns data/None
def getItem(path):
    try:
        response = s3_client.get_object(Bucket=AspiringStorageBucket, Key=path)
        data = response['Body'].read()
        # Return as string if it's text data
        try:
            return data.decode('utf-8')
        except UnicodeDecodeError:
            return data
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            return None
        else:
            print(f"Error getting item: {e}")
            return None


# delete a user item
# returns True/False
def deleteItem(path):
    try:
        s3_client.delete_object(Bucket=AspiringStorageBucket, Key=path)
        return True
    except ClientError as e:
        print(f"Error deleting item: {e}")
        return False


#  The following are helpers to implement the API

def createBucket(bucketname):
    try:
        s3_client.create_bucket(Bucket=bucketname)
        return True
    except ClientError as e:
        print(f"Error creating bucket: {e}")
        return False


def getBucket(bucketname):
    try:
        bucket = s3_resource.Bucket(bucketname)
        # Check if bucket exists
        s3_client.head_bucket(Bucket=bucketname)
        return bucket
    except ClientError as e:
        print(f"Error getting bucket: {e}")
        return None


def getConnection():
    # Return the s3_client for compatibility
    return s3_client


#
#
#  The following are user file abstraction
#    built using a key-value storage
#
#  The abstraction is simple
#  The path to the file is the key
#  The metadata on the key indicates if it is a file or directory
#  If it is a directory, then, it contains the list of files as the value
#  which gets updated when files get added or deleted
#
#  Note that the user is embedded into the filesystem path
#
#  path itself is a stringified json list
#
#

# path manipulation apis

# first define dir, and file classes

class File:
    def __init__(self, name, data):
        self.fname = name
        self.data = data

    def __str__(self):
        return f"File(name='{self.fname}', data_length={len(self.data) if self.data else 0})"


class Directory:
    def __init__(self, name, filelist):
        self.fname = name
        self.files = [File(i, "") for i in filelist]

    def __str__(self):
        return f"Directory(name='{self.fname}', files={[f.fname for f in self.files]})"


def pathToString(path):
    return json.dumps(path)


# path is a list
# returns True/False
def createDir(path):
    # check if dir exists, if so fail
    spath = pathToString(path)
    data = getItem(spath)
    if data is not None:
        print("dir exists")
        return False
    # create the dir file
    dirdata = {}
    dirdata["data"] = json.dumps([])
    dirdata["path"] = path
    dirdata["type"] = "dir"
    if not putItem(spath, json.dumps(dirdata)):
        print("putitem failed")
        return False
    return True


def deleteDir(path):
    # not implemented yet
    pass


# path is list, return python file object
def getFileRaw(path):
    spath = pathToString(path)
    data = getItem(spath)
    if data is None:
        return None
    try:
        filedata = json.loads(data)
        return filedata
    except json.JSONDecodeError:
        print("Error: Invalid JSON data")
        return None


def fetchFile(path):
    """
    Fetch file content from storage

    Args:
        path (list): Path to the file as a list (e.g., ["home", "user", "filename.txt"])

    Returns:
        str: File content if file exists and is a file type
        None: If file doesn't exist, is a directory, or error occurs
    """
    try:
        file_obj = getFile(path)

        # Check if file exists and is actually a file (not directory)
        if file_obj is None:
            print(f"File not found: {path}")
            return None

        if isinstance(file_obj, File):
            return file_obj.data
        elif isinstance(file_obj, Directory):
            print(f"Path is a directory, not a file: {path}")
            return None
        else:
            print(f"Unknown file type: {path}")
            return None

    except Exception as e:
        print(f"Error fetching file {path}: {e}")
        return None

# path is list, returns directory object or file object as the case
# may be


def getFile(path):
    data = getFileRaw(path)
    # print("getfile", data)
    if data is None:
        return None
    if data["type"] == "dir":
        fileslist = json.loads(data["data"])
        fname = path[len(path)-1]
        fileobj = Directory(fname, fileslist)
        return fileobj
    elif data["type"] == "file":
        fname = path[len(path)-1]
        fileobj = File(fname, data["data"])
        return fileobj
    else:
        return None


##
# path is list, data is a string
##
def createFile(path, data):
    # make sure parent dirs exist
    if len(path) <= 1:
        print("parent path failed")
        return False

    # Recursively create parent directories if not present
    for i in range(1, len(path)):
        subpath = path[:i]
        if getFileRaw(subpath) is None:
            print(f"Creating parent directory: {subpath}")
            if not createDir(subpath):
                print(f"Failed to create parent directory: {subpath}")
                return False

    # check if file exists
    spath = pathToString(path)
    if getItem(spath) is not None:
        print("file exists failed")
        return False

    # update the file
    filedata = {
        "data": data,
        "path": path,
        "type": "file"
    }

    if not putItem(spath, json.dumps(filedata)):
        print("putfile failed")
        return False

    # then update the parent directory
    ppath = path[:-1]
    parentdata = getFileRaw(ppath)
    if parentdata is None:
        print("unexpected error: parent should exist")
        deleteFile(path)
        return False

    fname = path[-1]
    fileslist = json.loads(parentdata["data"])
    if fname not in fileslist:
        fileslist.append(fname)
        parentdata["data"] = json.dumps(fileslist)
        if not putItem(pathToString(ppath), json.dumps(parentdata)):
            print("putdir failed")
            deleteFile(path)
            return False

    return True


##
# path is list, data is a string
##
def updateFile(path, data):
    # file must exist
    filedata = getFileRaw(path)
    if filedata is None:
        return False
    filedata["data"] = data
    if not putItem(pathToString(path), json.dumps(filedata)):
        return False
    return True


##
# path is list
##
def deleteFile(path):
    filedata = getFileRaw(path)
    if filedata is None or filedata["type"] != "file":
        print("file does not exist")
        return False
    #
    # update the parent directory first
    #
    ppath = path[:-1]
    parentdata = getFileRaw(ppath)
    if parentdata is None:
        print("parent data failed")
        return False
    fileslist = json.loads(parentdata["data"])
    newlist = []
    fname = path[len(path)-1]
    for i in fileslist:
        if fname == i:
            pass
        else:
            newlist.append(i)
    parentdata["data"] = json.dumps(newlist)
    if not putItem(pathToString(ppath), json.dumps(parentdata)):
        # this is unexpected, unwind !
        print("putdir failed")
        return False
    # then delete the file
    if not deleteItem(pathToString(path)):
        print("delete file failed")
        return False
    return True


# The following are unit tests

def unitTestItems():
    putItem("foobar1", "test1")
    print(getItem("foobar1"))
    putItem("foobar2", "test2")
    print(getItem("foobar2"))
    deleteItem("foobar1")
    deleteItem("foobar2")
    print(getItem("foobar1"))
    print(getItem("foobar2"))


def unitTestFiles():
    path = ["home", "demo"]
    print("--create dir--")
    createDir(path)
    print(getFileRaw(path))
    fpath = path[:]
    fpath.append("fname")
    print("--del file--")
    deleteFile(fpath)
    print("--create file--")
    createFile(fpath, "FileData Test1")
    print(getFileRaw(fpath))
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    print("--update file--")
    updateFile(fpath, "FileData Test2")
    print(getFileRaw(fpath))
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    print("--create second file--")
    fpath2 = path[:]
    fpath2.append("fname2")
    createFile(fpath2, "FileData2 Test1")
    print(getFileRaw(fpath2))
    print(getFileRaw(path))
    print(str(getFile(fpath2)))
    print("--update second file--")
    updateFile(fpath2, "FileData2 Test2")
    print(getFileRaw(fpath2))
    print(getFileRaw(path))
    print(str(getFile(fpath2)))
    print("--del file--")
    deleteFile(fpath)
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    deleteFile(fpath2)
    print(getFileRaw(path))
    print(str(getFile(fpath)))


print("Cloud imported")

if __name__ == "__main__":
    # unit tests here
    # unitTestItems()
    unitTestFiles()
