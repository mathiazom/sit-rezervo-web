import { Box, Divider, Stack } from "@mui/material";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import ConfigBar from "@/components/configuration/ConfigBar";
import AgendaModal from "@/components/modals/Agenda/AgendaModal";
import ChainUserSettingsModal from "@/components/modals/ChainUser/ChainUserSettingsModal";
import ClassInfoModal from "@/components/modals/ClassInfo/ClassInfoModal";
import SettingsModal from "@/components/modals/Settings/SettingsModal";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import WeekSchedule from "@/components/schedule/WeekSchedule";
import AppBar from "@/components/utils/AppBar";
import ChainSwitcher from "@/components/utils/ChainSwitcher";
import ErrorMessage from "@/components/utils/ErrorMessage";
import PageHead from "@/components/utils/PageHead";
import { classConfigRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { ChainProfile, RezervoClass, RezervoSchedule, RezervoWeekSchedule } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";

// Memoize to avoid redundant schedule re-render on class selection change
const WeekScheduleMemo = memo(WeekSchedule);

function Chain({
    initialSchedule,
    classPopularityIndex,
    chainProfile,
    error,
}: {
    initialSchedule: RezervoSchedule;
    classPopularityIndex: ClassPopularityIndex;
    chainProfile: ChainProfile;
    error: RezervoError | undefined;
}) {
    const { userConfig, userConfigError, userConfigLoading, allConfigsIndex } = useUserConfig(chainProfile.identifier);

    const [userConfigActive, setUserConfigActive] = useState(true);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<string[] | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isChainUserSettingsOpen, setIsChainUserSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);

    const [classInfoClass, setClassInfoClass] = useState<RezervoClass | null>(null);

    const [currentWeekSchedule, setCurrentWeekSchedule] = useState<RezervoWeekSchedule>(initialSchedule[0]!);

    const classes = useMemo(
        () => currentWeekSchedule.flatMap((daySchedule) => daySchedule.classes) ?? [],
        [currentWeekSchedule],
    );

    const onSelectedChanged = useCallback((classId: string, selected: boolean) => {
        setSelectedClassIds((s) =>
            s == null ? s : selected ? (s.includes(classId) ? s : [...s, classId]) : s.filter((c) => c != classId),
        );
    }, []);

    const scrollToTodayRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const classIds = userConfig?.classes?.map(classConfigRecurrentId) ?? null;
        setSelectedClassIds(classIds);
        setOriginalSelectedClassIds(classIds);
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig]);

    useEffect(() => {
        setCurrentWeekSchedule(initialSchedule[0]!);
    }, [initialSchedule]);

    useEffect(() => {
        scrollToToday();
    }, [scrollToTodayRef]);

    function scrollToToday() {
        const target = scrollToTodayRef.current;
        if (target != null) {
            target.scrollIntoView({
                behavior: "smooth",
                inline: "start",
            });
        }
    }

    return (
        <>
            <PageHead title={`${chainProfile.identifier}-rezervo`} />
            <Stack sx={{ height: "100%", overflow: "hidden" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <AppBar
                        leftComponent={<ChainSwitcher currentChainProfile={chainProfile} />}
                        rightComponent={
                            <ConfigBar
                                chain={chainProfile.identifier}
                                classes={classes}
                                selectedClassIds={selectedClassIds}
                                originalSelectedClassIds={originalSelectedClassIds}
                                userConfig={userConfig}
                                userConfigActive={userConfigActive}
                                isLoadingConfig={userConfig == null || userConfigLoading}
                                isConfigError={userConfigError}
                                onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                                onSettingsOpen={() => setIsSettingsOpen(true)}
                                onChainUserSettingsOpen={() => setIsChainUserSettingsOpen(true)}
                                onAgendaOpen={() => setIsAgendaOpen(true)}
                            />
                        }
                    />
                    {error === undefined && (
                        <WeekNavigator
                            chain={chainProfile.identifier}
                            initialSchedule={initialSchedule}
                            setCurrentWeekSchedule={setCurrentWeekSchedule}
                            onGoToToday={scrollToToday}
                        />
                    )}
                    <Divider orientation="horizontal" />
                </Box>
                {error === undefined ? (
                    <WeekScheduleMemo
                        chain={chainProfile.identifier}
                        weekSchedule={currentWeekSchedule}
                        classPopularityIndex={classPopularityIndex}
                        selectable={userConfig != undefined && !userConfigLoading && !userConfigError}
                        selectedClassIds={selectedClassIds}
                        allConfigsIndex={allConfigsIndex ?? null}
                        onSelectedChanged={onSelectedChanged}
                        onInfo={setClassInfoClass}
                        todayRef={scrollToTodayRef}
                    />
                ) : (
                    <ErrorMessage error={error} chainProfile={chainProfile} />
                )}
            </Stack>
            <ClassInfoModal
                chain={chainProfile.identifier}
                classInfoClass={classInfoClass}
                setClassInfoClass={setClassInfoClass}
                classPopularityIndex={classPopularityIndex}
                allConfigsIndex={allConfigsIndex}
            />
            <AgendaModal
                open={isAgendaOpen}
                setOpen={setIsAgendaOpen}
                userConfig={userConfig}
                classes={classes}
                selectedClassIds={selectedClassIds}
                onInfo={setClassInfoClass}
                onSelectedChanged={onSelectedChanged}
            />
            <SettingsModal
                open={isSettingsOpen}
                setOpen={setIsSettingsOpen}
                chainProfile={chainProfile}
                bookingActive={userConfigActive}
                setBookingActive={setUserConfigActive}
                openChainUserSettings={() => setIsChainUserSettingsOpen(true)}
            />
            <ChainUserSettingsModal
                open={isChainUserSettingsOpen}
                setOpen={setIsChainUserSettingsOpen}
                chain={chainProfile.identifier}
                onSubmit={() => setIsChainUserSettingsOpen(false)}
            />
        </>
    );
}

export default Chain;