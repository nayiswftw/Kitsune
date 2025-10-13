'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card';
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from '../dashboard/code-references';

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const question = questions?.[questionIndex];
  return (
    <>
      <Sheet>
        <div className="p-6 space-y-6">
          <AskQuestionCard />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Questions</h1>
            <p className="text-sm text-gray-600 mt-1">Review and explore your project's Q&A history.</p>
          </div>
          <div className="space-y-3">
            {questions?.length ? (
              questions.map((question, index) => (
                <SheetTrigger key={question.id} onClick={() => setQuestionIndex(index)}>
                  <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-md border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer">
                    <img
                      src={question?.user.imageUrl ?? "/default-avatar.png"}
                      height={40}
                      width={40}
                      alt="user"
                      className="rounded-full border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-900 font-semibold text-lg line-clamp-1">
                          {question?.question}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {question?.createdAt.toLocaleDateString()} at {question?.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                        {question?.answer}
                      </p>
                    </div>
                  </div>
                </SheetTrigger>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No questions yet. Ask one to get started!</p>
              </div>
            )}
          </div>
        </div>
        {question && (
          <SheetContent className="min-w-[85vw] h-full overflow-y-auto bg-gray-50 p-6">
            <SheetHeader className="space-y-4">
              <SheetTitle className="text-2xl font-bold text-gray-900 leading-tight">
                {question.question}
              </SheetTitle>
              <div className="prose prose-gray max-w-none max-h-[60vh] overflow-y-auto bg-white p-4 rounded-lg shadow-sm border">
                <MDEditor.Markdown source={question.answer} className='bg-transparent' />
              </div>
              <CodeReferences fileReferences={question.filesReferences ? JSON.parse(question.filesReferences) : []} />
            </SheetHeader>
          </SheetContent>
        )}
      </Sheet>
    </>
  )
}

export default QAPage