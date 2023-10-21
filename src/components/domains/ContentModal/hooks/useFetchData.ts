import { useState } from 'react'

import type { ActivityType, Course } from '@/types'

import { getActivities, getCourses } from '@/services'
import { allProgress } from '@/utils'

type dataType = {
  courseList: Course[]
  activityList: ActivityType[]
  updateAt: number
}

const useFetchData = () => {
  const [pos, setPos] = useState(0)
  const [data, setData] = useState<dataType>({
    courseList: [{ id: '-1', title: '전체' }],
    activityList: [],
    updateAt: 0,
  })

  const getData = async () => {
    const courses = await getCourses()
    const activities = await allProgress(
      courses.map(course => getActivities(course.title, course.id)),
      progress => setPos(progress),
    ).then(activities => activities.flat())

    const updateAt = new Date().getTime()

    setData({
      courseList: [{ id: '-1', title: '전체' }, ...courses],
      activityList: activities,
      updateAt,
    })

    setPos(0)

    chrome.storage.local.set({
      courses,
      activities,
      updateAt,
    })
  }

  const getLocalData = () => {
    chrome.storage.local.get(({ updateAt, courses, activities }) => {
      setData({
        courseList: [{ id: '-1', title: '전체' }, ...courses],
        activityList: activities,
        updateAt,
      })
    })
  }

  return [getData, getLocalData, data, pos] as const
}

export default useFetchData
