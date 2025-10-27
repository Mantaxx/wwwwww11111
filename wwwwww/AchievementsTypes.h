#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "AchievementsTypes.generated.h"

USTRUCT(BlueprintType)
struct FMasteryAchievement
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Achievement")
    int32 Year = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Achievement")
    FText Title;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Achievement", meta=(MultiLine=true))
    FText CombinedDescription;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Achievement")
    FText CoeffAndTag;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Achievement")
    int32 Importance = 1;
};

UCLASS(BlueprintType)
class UAchievementsDataAsset : public UDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Achievements")
    TArray<FMasteryAchievement> Achievements;
};