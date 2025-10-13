import React from 'react'
import IssueList from './issue-list';

type Props = {
  params: Promise<{ meetingId: string }>
}

async function MeetingDetailsPage({ params }: Props) {
  const { meetingId } = await params;
  return (
    <IssueList meetingId={meetingId} />
  )
}

export default MeetingDetailsPage