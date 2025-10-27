#include "RoadOfMastersActor.h"
#include "Components/SplineComponent.h"
#include "TimelineNode.h"
#include "AchievementsTypes.h"
#include "Engine/World.h"

#if WITH_EDITOR
#include "AssetRegistry/AssetRegistryModule.h"
#include "Editor.h"
#endif

ARoadOfMastersActor::ARoadOfMastersActor()
{
    PrimaryActorTick.bCanEverTick = false;

    SplineComponent = CreateDefaultSubobject<USplineComponent>(TEXT("Spline"));
    RootComponent = SplineComponent;
}

void ARoadOfMastersActor::OnConstruction(const FTransform& Transform)
{
    Super::OnConstruction(Transform);
    // Reposition existing nodes that may have DistanceOnSpline set
    for (ATimelineNode* N : TimelineNodes)
    {
        if (IsValid(N) && SplineComponent)
        {
            FVector Loc = SplineComponent->GetLocationAtDistanceAlongSpline(N->DistanceOnSpline, ESplineCoordinateSpace::World);
            FRotator Rot = SplineComponent->GetRotationAtDistanceAlongSpline(N->DistanceOnSpline, ESplineCoordinateSpace::World);
            N->SetActorLocationAndRotation(Loc, Rot);
        }
    }
}

void ARoadOfMastersActor::ParseTextAndBuildTimeline()
{
#if WITH_EDITOR
    if (!SplineComponent) return;

    // 1) split lines and group by year
    TMap<int32, TArray<FString>> YearMap;
    TArray<FString> Lines;
    RawAchievementsText.ParseIntoArrayLines(Lines, true);

    for (FString& L : Lines)
    {
        FString Line = L.TrimStartAndEnd();
        if (Line.IsEmpty()) continue;

        TArray<FString> Tokens;
        Line.ParseIntoArrayWS(Tokens);
        if (Tokens.Num() == 0) continue;

        int32 Year = FCString::Atoi(*Tokens[0]);
        if (Year < 1900 || Year > 3000) continue;

        if (Year >= 2001 && Year <= 2025)
        {
            YearMap.FindOrAdd(Year).Add(Line);
        }
    }

    // Ensure all years exist
    for (int32 Y = 2001; Y <= 2025; ++Y)
    {
        if (!YearMap.Contains(Y))
        {
            YearMap.Add(Y, TArray<FString>());
        }
    }

    // 2) create or fill AchievementsAsset in-memory if none assigned
    if (!AchievementsAsset)
    {
        FString AssetName = FString::Printf(TEXT("Achievements_%s"), *GetName());
        FString PackageName = FString::Printf(TEXT("/Game/Generated/%s"), *AssetName);
        UPackage* Package = CreatePackage(*PackageName);
        AchievementsAsset = NewObject<UAchievementsDataAsset>(Package, *AssetName, RF_Public|RF_Standalone);
#if WITH_EDITOR
        FAssetRegistryModule::AssetCreated(AchievementsAsset);
#endif
        AchievementsAsset->AddToRoot();
    }

    AchievementsAsset->Achievements.Empty();

    for (int32 Y = 2001; Y <= 2025; ++Y)
    {
        FMasteryAchievement Entry;
        Entry.Year = Y;
        const TArray<FString>& LinesForYear = YearMap.FindChecked(Y);
        if (LinesForYear.Num() == 0)
        {
            Entry.Title = FText::FromString(FString::Printf(TEXT("%d — no recorded results"), Y));
            Entry.CombinedDescription = FText::FromString(TEXT("No recorded achievements."));
            Entry.CoeffAndTag = FText::GetEmpty();
            Entry.Importance = 1;
        }
        else
        {
            Entry.Title = FText::FromString(FString::Printf(TEXT("%d — %d items"), Y, LinesForYear.Num()));
            FString Combined;
            for (const FString& S : LinesForYear)
            {
                Combined += S;
                Combined += TEXT("\n");
            }
            Entry.CombinedDescription = FText::FromString(Combined);
            Entry.CoeffAndTag = FText::GetEmpty();
            Entry.Importance = FMath::Clamp(LinesForYear.Num(), 1, 10);
        }
        AchievementsAsset->Achievements.Add(Entry);
    }

    // 3) destroy existing nodes owned by this actor
    for (ATimelineNode* Node : TimelineNodes)
    {
        if (IsValid(Node))
        {
            Node->Destroy();
        }
    }
    TimelineNodes.Empty();

    // 4) spawn nodes equally spaced between start and end
    float SplineLen = SplineComponent->GetSplineLength();
    float Start = TimelineStartDistance;
    float End = (TimelineEndDistance > Start) ? TimelineEndDistance : SplineLen;
    float Usable = FMath::Max(1.f, End - Start);

    const int32 Count = 2025 - 2001 + 1;
    for (int32 i = 0; i < Count; ++i)
    {
        int32 Year = 2001 + i;
        float Fraction = (Count == 1) ? 0.5f : (float)i / (float)(Count - 1);
        float Dist = Start + Fraction * Usable;
        FVector Loc = SplineComponent->GetLocationAtDistanceAlongSpline(Dist, ESplineCoordinateSpace::World);
        FRotator Rot = SplineComponent->GetRotationAtDistanceAlongSpline(Dist, ESplineCoordinateSpace::World);

        if (TimelineNodeClass)
        {
            FActorSpawnParameters Params;
            Params.Owner = this;
            ATimelineNode* Node = GetWorld()->SpawnActor<ATimelineNode>(TimelineNodeClass, Loc, Rot, Params);
            if (Node)
            {
                Node->DistanceOnSpline = Dist;
                Node->Year = Year;
                // copy data from asset
                for (const FMasteryAchievement& A : AchievementsAsset->Achievements)
                {
                    if (A.Year == Year)
                    {
                        Node->Title = A.Title;
                        Node->CombinedDescription = A.CombinedDescription;
                        Node->CoeffAndTag = A.CoeffAndTag;
                        Node->Importance = A.Importance;
                        break;
                    }
                }
                Node->AttachToActor(this, FAttachmentTransformRules::KeepWorldTransform);
                TimelineNodes.Add(Node);
            }
        }
    }

    // flag actor modified
    Modify();
    if (GEditor) GEditor->RedrawLevelEditingViewports(true);
#endif
}