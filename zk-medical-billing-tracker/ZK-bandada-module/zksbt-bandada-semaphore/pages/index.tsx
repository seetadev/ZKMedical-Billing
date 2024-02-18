import { Identity } from "@semaphore-protocol/identity"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { getGroup } from "@/utils/bandadaApi"
import Stepper from "@/components/stepper"
import Divider from "@/components/divider"

export default function Home() {
  const router = useRouter()

  const [_identity, setIdentity] = useState<Identity>()

  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!

  useEffect(() => {
    const identityString = localStorage.getItem(localStorageTag)

    if (identityString) {
      const identity = new Identity(identityString)

      setIdentity(identity)

      console.log(
        "Your Semaphore identity was retrieved from the browser cache 👌🏽"
      )
    } else {
      console.log("Create your Semaphore identity 👆🏽")
    }
  }, [localStorageTag])

  const createIdentity = async () => {
    const identity = new Identity()

    setIdentity(identity)

    localStorage.setItem(localStorageTag, identity.toString())

    console.log("Your new Semaphore identity was just created 🎉")
  }

  const joinGroup = async () => {
    const groupId = process.env.NEXT_PUBLIC_BANDADA_GROUP_ID!
    const group = await getGroup(groupId)

    if (group === null) {
      alert("Some error ocurred! Group not found!")
      return
    }

    const providerName = group.credentials.id.split("_")[0].toLowerCase()

    const identityCommitment = _identity?.getCommitment().toString()

    window.open(
      `${process.env.NEXT_PUBLIC_BANDADA_DASHBOARD_URL}/credentials?group=${groupId}&member=${identityCommitment}&provider=${providerName}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}`
    )
  }

  const renderIdentity = () => {
    return (
      <div className="lg:w-2/5 md:w-2/4 w-full">
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-semibold text-slate-700">Identity</div>
          <div>
            <button
              className="flex justify-center items-center w-auto space-x-1 verify-btn text-lg font-medium rounded-md bg-gradient-to-r text-slate-700"
              onClick={createIdentity}
            >
              <span>New</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="overflow-auto border-2 p-7 border-slate-300 space-y-3">
            <div className="flex space-x-2">
              <div>Trapdoor:</div>
              <div>{_identity?.trapdoor.toString()}</div>
            </div>
            <div className="flex space-x-2">
              <div>Nullifier:</div>
              <div>{_identity?.nullifier.toString()}</div>
            </div>
            <div className="flex space-x-2">
              <div>Commitment:</div>
              <div>{_identity?.commitment.toString()}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div>
        <div className="flex justify-center items-center">
          <h1 className="text-3xl font-semibold text-slate-700">Identities</h1>
        </div>
        <div className="flex justify-center items-center mt-10">
          <span className="lg:w-2/5 md:w-2/4 w-full">
            <span>
              Users interact with Bandada using a{" "}
              <a
                className="space-x-1 text-blue-700 hover:underline"
                href="https://semaphore.pse.dev/docs/guides/identities"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                Semaphore identity
              </a>{" "}
              (similar to Ethereum accounts). It contains three values:
            </span>
            <ol className="list-decimal pl-4 mt-5 space-y-3">
              <li>Trapdoor: private, known only by user</li>
              <li>Nullifier: private, known only by user</li>
              <li>Commitment: public</li>
            </ol>
            <Divider />
          </span>
        </div>
        <div className="flex justify-center items-center mt-5">
          {_identity ? (
            renderIdentity()
          ) : (
            <button
              className="flex justify-center items-center w-auto space-x-3 verify-btn text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100"
              onClick={createIdentity}
            >
              Create identity
            </button>
          )}
        </div>
        <div className="flex justify-center items-center mt-10">
          <div className="lg:w-2/5 md:w-2/4 w-full">
            <Stepper
              step={1}
              onNextClick={_identity && (() => router.push("/groups"))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
